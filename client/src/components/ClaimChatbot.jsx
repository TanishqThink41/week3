// ClaimChatbot.jsx

import React, { useState, useEffect } from "react";
import { format } from "date-fns";

function ClaimChatbot({ onClaimComplete, initialPolicyData }) {
  // State to track conversation step
  const [step, setStep] = useState(0);

  // Fields for claim data
  const [customerName, setCustomerName] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [treatmentDate, setTreatmentDate] = useState(""); // new field
  const [incidentDescription, setIncidentDescription] = useState("");
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [treatmentAmount, setTreatmentAmount] = useState("");
  const [coverageCheck, setCoverageCheck] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState("");
  const [doctorDetails, setDoctorDetails] = useState("");
  
  // Chatbot prompt and loading states.
  const [chatbotPrompt, setChatbotPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Steps (order matters)
  const steps = [
    "Please provide the customer's name who wants to claim.",
    "Please provide the incident date (YYYY-MM-DD).",
    "Please provide the treatment date (YYYY-MM-DD).",
    "Please describe what happened.",
    "Please describe the treatment you received.",
    "Please provide the treatment money amount.",
    "Checking your policy coverage to see if this claim might be covered...",
    "Please provide the hospital name and address (separate name and location by a comma).",
    "Please provide the doctor's name and contact (separate name and phone by a comma).",
    "Generating your claim file..."
  ];

  // Update prompt when step changes.
  useEffect(() => {
    if (step === 6) {
      checkPolicyCoverage();
    } else if (step === steps.length - 1) {
      generateClaimSummary();
    } else {
      setChatbotPrompt(steps[step]);
    }
  }, [step]);

  // (Optional) Simulate a Gemini API call for policy coverage check.
  const checkPolicyCoverage = async () => {
    setLoadingPrompt(true);
    // Simulated output from Gemini API call.
    const simulatedOutput =
      "Covered. The claim is for $200. The treatment is within the policy limits.";
    setCoverageCheck(simulatedOutput);
    setChatbotPrompt(`Policy Coverage Result: ${simulatedOutput}. If you wish to continue, click "Next".`);
    setLoadingPrompt(false);
  };

  // Generate a formatted claim summary using date-fns for date formatting.
  const generateClaimSummary = async () => {
    setLoadingPrompt(true);
    // Format the current date.
    const currentDate = format(new Date(), "MMMM d, yyyy");

    // Create a Markdown formatted claim summary.
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

**VI. Recommendation:**

* **Recommended Action:** ${coverageCheck.includes("Covered") ? "Process claim for reimbursement." : "Further review required."}
* **Notes:** Verify provider credentials. Confirm specific services rendered and applicable policy benefits.

**Disclaimer:** This summary is based on the information provided and is subject to verification and final approval by the Claims Department.
    `;

    // Pass the formatted summary along with other claim details to the parent component.
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
    });
    setChatbotPrompt("Claim summary generated and submitted!");
    setLoadingPrompt(false);
  };

  // Handle user input for each step.
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.userInput.value.trim();
    if (!input) return;

    // Save input based on current step.
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

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>{loadingPrompt ? "Loading..." : chatbotPrompt}</p>
      </div>
      {step < steps.length - 1 && (
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
      )}
      {/* Special case for step 6 (policy coverage call) */}
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