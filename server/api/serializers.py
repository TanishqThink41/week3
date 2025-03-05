from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Item, UserProfile, Policy, MedicalHistory, Claim, Document

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_picture', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'document_type', 'file_path', 'created_at']

class ClaimSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    policy_provider = serializers.SerializerMethodField()
    policy_holder_name = serializers.SerializerMethodField()
    incident_date = serializers.DateTimeField(source='treatment_date', required=False)
    incident_description = serializers.CharField(source='cause', required=False)
    claim_details = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    
    class Meta:
        model = Claim
        fields = ['id', 'treatment', 'treatment_date', 'cause', 'status', 'created_at', 'updated_at',
                  'documents', 'policy_number', 'policy_provider', 'policy_holder_name', 
                  'incident_date', 'incident_description', 'claim_details', 'timeline', 'policy']
        read_only_fields = ['id', 'created_at', 'updated_at', 'documents', 'policy_number', 
                           'policy_provider', 'policy_holder_name', 'claim_details', 'timeline']
    
    def get_policy_provider(self, obj):
        # This would typically come from policy.provider or similar field
        # For now returning a placeholder
        return "Health Insurance Provider"
    
    def get_policy_holder_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_claim_details(self, obj):
        return f"Health Insurance Claim: {obj.cause if obj.cause else 'Medical treatment'}"
    
    def get_timeline(self, obj):
        import datetime
        from django.utils import timezone
        
        # Start with the actual submission date
        submission_date = obj.created_at
        
        timeline = [
            {
                'date': submission_date.strftime('%Y-%m-%d'),
                'action': 'Claim submitted',
                'actor': 'You',
                'completed': True
            },
        ]
        
        # Review typically happens 1 day after submission
        review_date = submission_date + datetime.timedelta(days=1)
        review_completed = True  # Review is always completed
        
        timeline.append({
            'date': review_date.strftime('%Y-%m-%d'),
            'action': 'Claim received and under review',
            'actor': 'Insurance Company',
            'completed': review_completed
        })
        
        # Decision date is typically 3 days after submission
        decision_date = submission_date + datetime.timedelta(days=3)
        
        # If the claim has been updated (decision made), use that date instead
        if obj.updated_at and obj.updated_at > submission_date and (obj.status == 'approved' or obj.status == 'rejected'):
            decision_date = obj.updated_at
            decision_completed = True
        else:
            # If decision date is in the future, show future date
            now = timezone.now()
            decision_completed = decision_date <= now
            if not decision_completed:
                # For pending decisions in the future, use the expected date
                pass
        
        if obj.status == 'approved':
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim approved',
                'actor': 'Insurance Company',
                'completed': decision_completed
            })
            
            # Payment processed 2 days after approval
            payment_date = decision_date + datetime.timedelta(days=2)
            payment_completed = payment_date <= timezone.now()
            
            timeline.append({
                'date': payment_date.strftime('%Y-%m-%d'),
                'action': 'Payment processed',
                'actor': 'Insurance Company',
                'completed': payment_completed
            })
        elif obj.status == 'rejected':
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim rejected',
                'actor': 'Insurance Company',
                'completed': decision_completed
            })
        else:  # pending
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim decision pending',
                'actor': 'Insurance Company',
                'completed': False  # Always false for pending
            })
        
        return timeline

class PolicySerializer(serializers.ModelSerializer):
    claims = ClaimSerializer(many=True, read_only=True)
    
    class Meta:
        model = Policy
        fields = ['id', 'policy_number', 'coverage_details', 'exclusions', 'document_url', 'start_date', 'end_date', 'claims']

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition', 'diagnosis_date', 'treatment', 'created_at']
        read_only_fields = ['id', 'created_at']
