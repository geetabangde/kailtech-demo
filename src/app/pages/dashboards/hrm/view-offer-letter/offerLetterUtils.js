/**
 * Helper utilities for HRM Offer Letters and Internship Letters.
 * Handles date-wise ID generation in the format: KTRC/OFFER/DDMMYYYY/001, 002, 003...
 */

/**
 * Format a Date object or date string into DDMMYYYY string (e.g. 29082026)
 * @param {string|Date} dateInput
 * @returns {string} 8-digit date string DDMMYYYY
 */
export const formatDateDDMMYYYY = (dateInput) => {
  let d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    d = new Date();
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}${mm}${yyyy}`;
};

/**
 * Generate next date-wise sequence Offer Letter ID: KTRC/OFFER/DDMMYYYY/001, 002, 003...
 * Checks existing offer letter records for that date and increments sequence.
 * Resets to 001 for a different date.
 * 
 * @param {string|Date} dateInput
 * @param {Array} existingRecords
 * @returns {{ id: string, reference_no: string, seq_no: number, datePart: string, seqPadded: string }}
 */
export const generateOfferLetterId = (dateInput, existingRecords = []) => {
  const datePart = formatDateDDMMYYYY(dateInput);
  const prefix = `KTRC/OFFER/${datePart}/`;

  let maxSeq = 0;

  // Gather records from memory + localStorage
  let allRecords = Array.isArray(existingRecords) ? [...existingRecords] : [];
  try {
    const local = JSON.parse(localStorage.getItem("local_offer_letters") || "[]");
    if (Array.isArray(local)) {
      allRecords = [...allRecords, ...local];
    }
  } catch (err) {
    console.warn("Could not read local_offer_letters for ID generation", err);
  }

  allRecords.forEach((record) => {
    if (!record) return;
    const ref = String(record.reference_no || record.id || "");

    // 1. Direct prefix match: KTRC/OFFER/29082026/001
    if (ref.startsWith(prefix)) {
      const seqStr = ref.slice(prefix.length).split("/")[0].replace(/\D/g, "");
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    } else {
      // 2. Check if record date matches datePart
      const recDate = record.offerletterdate || record.created_at || record.joiningdate;
      if (recDate && formatDateDDMMYYYY(recDate) === datePart) {
        if (record.seq_no && Number(record.seq_no) > maxSeq) {
          maxSeq = Number(record.seq_no);
        } else if (ref.includes("/")) {
          const parts = ref.split("/");
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum) && lastNum > maxSeq) {
            maxSeq = lastNum;
          }
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(3, "0");
  const fullId = `${prefix}${seqPadded}`;

  return {
    id: fullId,
    reference_no: fullId,
    seq_no: nextSeq,
    datePart,
    seqPadded,
  };
};

/**
 * Format reference number for displaying on letter documents or list tables
 * @param {Object} offerLetter
 * @returns {string} Formatted ID (e.g. KTRC/OFFER/29082026/001)
 */
export const formatOfferLetterRefNo = (offerLetter) => {
  if (!offerLetter) return "—";

  // Do not format internship letters as KTRC/OFFER
  const isInternship =
    offerLetter.letter_type === "internship" ||
    offerLetter.id === "1042" ||
    String(offerLetter.designation_name || offerLetter.designation || "").toLowerCase().includes("apprentice");

  if (isInternship) {
    return "Internship";
  }

  if (
    offerLetter.reference_no &&
    typeof offerLetter.reference_no === "string" &&
    offerLetter.reference_no.startsWith("KTRC/OFFER/")
  ) {
    return offerLetter.reference_no;
  }

  if (
    offerLetter.id &&
    typeof offerLetter.id === "string" &&
    offerLetter.id.startsWith("KTRC/OFFER/")
  ) {
    return offerLetter.id;
  }

  const datePart = formatDateDDMMYYYY(offerLetter.offerletterdate || offerLetter.created_at);

  let seq = "001";
  if (offerLetter.seq_no) {
    seq = String(offerLetter.seq_no).padStart(3, "0");
  } else if (offerLetter.id) {
    const idStr = String(offerLetter.id);
    const parts = idStr.split("/");
    const lastPart = parts[parts.length - 1].replace(/\D/g, "");
    const num = parseInt(lastPart, 10);
    if (!isNaN(num)) {
      seq = String(num).padStart(3, "0");
    } else {
      seq = "001";
    }
  }

  return `KTRC/OFFER/${datePart}/${seq}`;
};
