// ClaimChatbot.jsx

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { uploadFileToCloudinary } from "../utils/cloudinary";  // Ensure this file exists

function ClaimChatbot({ onClaimComplete, initialPolicyData }) {
  // Track the current conversation step.
  const [step, setStep] = useState(0);

  // State for claim fields.
  const [customerName, setCustomerName] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [treatmentDate, setTreatmentDate] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [treatmentAmount, setTreatmentAmount] = useState("");
  const [coverageCheck, setCoverageCheck] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState("");
  const [doctorDetails, setDoctorDetails] = useState("");
  // New state for supporting document URL.
  const [supportingDocUrl, setSupportingDocUrl] = useState("");

  // Prompt message and loading state.
  const [chatbotPrompt, setChatbotPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Define steps (order matters):
  // 0. Customer name
  // 1. Incident date
  // 2. Treatment date
  // 3. Incident description
  // 4. Treatment description
  // 5. Treatment money amount (claim amount)
  // 6. Policy coverage check (simulated Gemini API call)
  // 7. Hospital details
  // 8. Doctor details
  // 9. Supporting document upload
  // 10. Generating claim file
  const steps = [
    "Please provide the customer's name who wants to claim.",
    "Please provide the incident date.",
    "Please provide the treatment date.",
    "Please describe what happened.",
    "Please describe the treatment you received.",
    "Please provide the treatment money amount.",
    "Checking your policy coverage to see if this claim might be covered...",
    "Please provide the hospital name and address (separate name and location by a comma).",
    "Please provide the doctor's name and contact (separate name and phone by a comma).",
    "Please upload your supporting documents (select file).",
    "Generating your claim file..."
  ];

  // Update prompt on step change.
  useEffect(() => {
    if (step === 6) {
      checkPolicyCoverage();
    } else if (step === steps.length - 1) {
      generateClaimSummary();
    } else {
      setChatbotPrompt(steps[step]);
    }
  }, [step]);

  // (Optional) Simulated Gemini API call for coverage check.
  const checkPolicyCoverage = async () => {
    setLoadingPrompt(true);
    // Simulate a Gemini API response.
    const simulatedOutput =
      "Covered. The claim is for $" + treatmentAmount + ". The treatment is within the policy limits.";
    setCoverageCheck(simulatedOutput);
    setChatbotPrompt(`Policy Coverage Result: ${simulatedOutput}. If you wish to continue, click "Next".`);
    setLoadingPrompt(false);
  };

  // Generate a formatted claim summary.
  const generateClaimSummary = async () => {
    setLoadingPrompt(true);
    const currentDate = format(new Date(), "MMMM d, yyyy");

    // Build a Markdown formatted summary.
    const formattedSummary = `
**Claim ID:** (To be assigned by Claims Department)

**Date Prepared:** ${currentDate}

**I. Claimant Information:**

* **Customer Name:** ${customerName}

**II. Incident Details:**

* **Incident Date:** ${incidentDate}
* **Treatment Date:** ${treatmentDate}
* **Incident Description:** ${incidentDescription}

**III. Treatment Details:**

* **Treatment Description:** ${treatmentDescription}
* **Treatment Amount:** ${treatmentAmount}

**IV. Provider Information:**

* **Hospital Name:** ${hospitalDetails.split(",")[0] || ""}
* **Hospital Location:** ${hospitalDetails.split(",")[1] || ""}
* **Doctor Name:** ${doctorDetails.split(",")[0] || ""}
* **Doctor Phone:** ${doctorDetails.split(",")[1] || ""}

**V. Policy Coverage & Recommendation:**

* **Policy Coverage Check:** ${coverageCheck.includes("Covered") ? "Covered" : "Not Covered"}
* **Justification:** ${coverageCheck}
* **Coverage Details:** Based on the treatment amount of ${treatmentAmount}, the services fall within the coverage limits.

**VI. Supporting Document:**

* ${supportingDocUrl ? `[View Document](${supportingDocUrl})` : "No document provided."}

**VII. Recommendation:**

* **Recommended Action:** ${coverageCheck.includes("Covered") ? "Process claim for reimbursement." : "Further review required."}
* **Notes:** Verify provider credentials. Confirm specific services rendered and applicable policy benefits.

**Disclaimer:** This summary is based on the information provided and is subject to verification and final approval by the Claims Department.
    `;
    // Pass the formatted summary and data back.
    onClaimComplete({
      customerName,
      incidentDate,
      treatmentDate,
      incidentDescription,
      treatmentDescription,
      treatmentAmount,
      coverageCheck,
      hospitalDetails,
      doctorDetails,
      claimSummary: formattedSummary,
      documentUrl: supportingDocUrl, // Save the URL from Cloudinary.
    });
    setChatbotPrompt("Claim summary generated and submitted!");
    setLoadingPrompt(false);
  };

  // Handle text input for steps (except file upload step).
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.userInput.value.trim();
    if (!input) return;
    switch (step) {
      case 0:
        setCustomerName(input);
        break;
      case 1:
        setIncidentDate(input);
        break;
      case 2:
        setTreatmentDate(input);
        break;
      case 3:
        setIncidentDescription(input);
        break;
      case 4:
        setTreatmentDescription(input);
        break;
      case 5:
        setTreatmentAmount(input);
        break;
      case 7:
        setHospitalDetails(input);
        break;
      case 8:
        setDoctorDetails(input);
        break;
      default:
        break;
    }
    e.target.elements.userInput.value = "";
    setStep((prev) => prev + 1);
  };

  // Handle file upload at step 9.
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingPrompt(true);
    try {
      // Call your Cloudinary function.
      const secureUrl = await uploadFileToCloudinary(file);
      setSupportingDocUrl(secureUrl);
      setChatbotPrompt("Supporting document uploaded successfully. Click Next to continue.");
    } catch (error) {
      console.error("Upload failed:", error);
      setChatbotPrompt("File upload failed. Please try again.");
    }
    setLoadingPrompt(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>{loadingPrompt ? "Loading..." : chatbotPrompt}</p>
      </div>
      {/* For file upload step (step 9), render file input */}
      {step === 9 ? (
        <div className="flex space-x-2">
          <input type="file" name="docFile" onChange={handleFileUpload} />
          <button
            onClick={() => setStep((prev) => prev + 1)}
            disabled={loadingPrompt || !supportingDocUrl}
            className="px-4 py-2 bg-primary-600 text-white rounded"
          >
            Next
          </button>
        </div>
      ) : (
        // Render text-input form for other steps.
        step < steps.length - 1 && (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              name="userInput"
              placeholder="Type your answer..."
              className="flex-grow p-2 border rounded"
              disabled={loadingPrompt}
            />
            <button
              type="submit"
              disabled={loadingPrompt}
              className="px-4 py-2 bg-primary-600 text-white rounded"
            >
              Next
            </button>
          </form>
        )
      )}
      {/* Special case: for step 6 (coverage check), allow a separate Next button */}
      {step === 6 && (
        <button
          onClick={() => setStep((prev) => prev + 1)}
          disabled={loadingPrompt}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded"
        >
          Next
        </button>
      )}
    </div>
  );
}

export default ClaimChatbot;