import assert from "node:assert/strict";
import test from "node:test";

import { validateField } from "../../../../../../shared/utils/validation/formValidation.js";
import { FIELD_RULES } from "./courseInternshipFormData.js";

test("accepts whole-number course offers from 0 through 100", () => {
    assert.equal(validateField("offer", "0", FIELD_RULES), "");
    assert.equal(validateField("offer", "50", FIELD_RULES), "");
    assert.equal(validateField("offer", "100", FIELD_RULES), "");
});

test("rejects fractional and out-of-range course offers", () => {
    for (const offer of ["", "1.5", "-1", "101", "abc"]) {
        assert.notEqual(validateField("offer", offer, FIELD_RULES), "");
    }
});
