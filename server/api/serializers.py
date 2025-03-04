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
    incident_date = serializers.DateTimeField(source='treatment_date')
    incident_description = serializers.CharField(source='cause')
    claim_details = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    
    class Meta:
        model = Claim
        fields = ['id', 'treatment', 'treatment_date', 'cause', 'status', 'created_at', 'updated_at',
                  'documents', 'policy_number', 'policy_provider', 'policy_holder_name', 
                  'incident_date', 'incident_description', 'claim_details', 'timeline']
    
    def get_policy_provider(self, obj):
        # This would typically come from policy.provider or similar field
        # For now returning a placeholder
        return "State Farm"
    
    def get_policy_holder_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_claim_details(self, obj):
        return f"Treatment: {obj.treatment}. {obj.cause if obj.cause else ''}"
    
    def get_timeline(self, obj):
        timeline = [
            {
                'date': obj.created_at.strftime('%Y-%m-%d'),
                'action': 'Claim submitted',
                'actor': 'You'
            },
        ]
        
        # Add review entry after submission
        review_date = obj.created_at.replace(day=obj.created_at.day + 1)
        timeline.append({
            'date': review_date.strftime('%Y-%m-%d'),
            'action': 'Claim received and under review',
            'actor': 'Insurance Company'
        })
        
        # Add status-specific entries
        if obj.status == 'approved':
            approved_date = obj.updated_at.strftime('%Y-%m-%d')
            timeline.append({
                'date': approved_date,
                'action': 'Claim approved',
                'actor': 'Insurance Company'
            })
            
            # Add payment processed 2 days after approval
            import datetime
            payment_date = (obj.updated_at + datetime.timedelta(days=2)).strftime('%Y-%m-%d')
            timeline.append({
                'date': payment_date,
                'action': 'Payment processed',
                'actor': 'Insurance Company'
            })
        elif obj.status == 'rejected':
            rejected_date = obj.updated_at.strftime('%Y-%m-%d')
            timeline.append({
                'date': rejected_date,
                'action': 'Claim rejected',
                'actor': 'Insurance Company'
            })
        
        return timeline

class PolicySerializer(serializers.ModelSerializer):
    claims = ClaimSerializer(many=True, read_only=True)
    
    class Meta:
        model = Policy
        fields = ['id', 'policy_number', 'coverage_details', 'exclusions', 'start_date', 'end_date', 'claims']

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition', 'diagnosis_date', 'treatment', 'created_at']
