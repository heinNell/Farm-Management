{
  "template_name": "Tractor Maintenance Audit Checklist",
  "description": "Comprehensive tractor maintenance audit with Good/Repair/Replace logic and mandatory photo evidence for defects.",
  "type": "maintenance",
  "frequency": "monthly",
  "categories": [
    {
      "id": "servicing",
      "name": "Servicing",
      "weight": 20,
      "items": [
        {
          "id": "srv_1",
          "description": "Is there an SIC for tractor maintenance?",
          "weight": 25,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_2",
          "description": "Is the SIC up to date and a true representation of the state of the tractor?",
          "weight": 10,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_3",
          "description": "Is the service record and deadline for the next service clearly marked?",
          "weight": 10,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_4",
          "description": "Is the service program in place and implemented up to date?",
          "weight": 25,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_5",
          "description": "Is the vehicle not overdue for service?",
          "weight": 15,
          "order": 5,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_6",
          "description": "Is the hour meter operational?",
          "weight": 7,
          "order": 6,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "srv_7",
          "description": "Is the tractor number clearly marked?",
          "weight": 8,
          "order": 7,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "engine",
      "name": "Engine",
      "weight": 20,
      "items": [
        {
          "id": "eng_1",
          "description": "Is the engine clean and clear of dust, oil, grease and dirt?",
          "weight": 5,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_2",
          "description": "Is the vehicle starter operational?",
          "weight": 5,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_3",
          "description": "Does the vehicle start instantly?",
          "weight": 5,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_4",
          "description": "Is the engine oil at the correct level?",
          "weight": 10,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_5",
          "description": "Is water at the correct level?",
          "weight": 10,
          "order": 5,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_6",
          "description": "Is the Gearbox oil at the correct level?",
          "weight": 10,
          "order": 6,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_7",
          "description": "Is the steering fluid at the correct level?",
          "weight": 10,
          "order": 7,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_8",
          "description": "Are there no oil leaks?",
          "weight": 5,
          "order": 8,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_9",
          "description": "Are there no fuel leaks?",
          "weight": 5,
          "order": 9,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_10",
          "description": "Are there no water leaks?",
          "weight": 8,
          "order": 10,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_11",
          "description": "Is the engine not smoking?",
          "weight": 7,
          "order": 11,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_12",
          "description": "Are hydraulics effective and operational?",
          "weight": 5,
          "order": 12,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_13",
          "description": "Is the PTO operational?",
          "weight": 5,
          "order": 13,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "eng_14",
          "description": "Is the engine paintwork up to date?",
          "weight": 10,
          "order": 14,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "chassis",
      "name": "Chassis",
      "weight": 15,
      "items": [
        {
          "id": "chs_1",
          "description": "Have all grease points been greased and are clean?",
          "weight": 20,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "chs_2",
          "description": "Vehicle/tractor is clean, clear of dust, diesel, grease and oil",
          "weight": 20,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "chs_3",
          "description": "Are all lights working?",
          "weight": 20,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "chs_4",
          "description": "Has paintwork been maintained, not faded or worn off?",
          "weight": 20,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "chs_5",
          "description": "Is the bodywork not in need of panel beating?",
          "weight": 20,
          "order": 5,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "wheels",
      "name": "Wheels and Tyres",
      "weight": 20,
      "items": [
        {
          "id": "whl_1",
          "description": "Check if the steering does not have more than 10 degrees of freeplay?",
          "weight": 5,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_2",
          "description": "Is the power steering operational and effective?",
          "weight": 5,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_3",
          "description": "Are the tyres of the correct specification?",
          "weight": 10,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_4",
          "description": "Have the tyres been fitted accurately around the rim?",
          "weight": 10,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_5",
          "description": "Are tyres inflated to the correct pressures?",
          "weight": 10,
          "order": 5,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_6",
          "description": "Are tyre treads not worn less than 3mm above the base?",
          "weight": 10,
          "order": 6,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_7",
          "description": "Are the wheel nuts correctly fastened?",
          "weight": 10,
          "order": 7,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_8",
          "description": "Is there zero play in the wheel bearings?",
          "weight": 10,
          "order": 8,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_9",
          "description": "Are the brakes effective?",
          "weight": 10,
          "order": 9,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "whl_10",
          "description": "Are the brakes not noisy?",
          "weight": 10,
          "order": 10,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "lights",
      "name": "Lights",
      "weight": 10,
      "items": [
        {
          "id": "lgt_1",
          "description": "Are head lights working?",
          "weight": 20,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "lgt_2",
          "description": "Are rear lights working?",
          "weight": 20,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "lgt_3",
          "description": "Is there no broken lenses to all the lights on the vehicle?",
          "weight": 20,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "lgt_4",
          "description": "Are side lights or indicators all working?",
          "weight": 20,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "lgt_5",
          "description": "Are parklights working as expected?",
          "weight": 20,
          "order": 5,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "performance",
      "name": "Performance",
      "weight": 5,
      "items": [
        {
          "id": "prf_1",
          "description": "Is the most recent fuel consumption at or better than benchmarks for the type?",
          "weight": 30,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "prf_2",
          "description": "Is the vehicle pulling per expected standards required?",
          "weight": 30,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "prf_3",
          "description": "Has the vehicle had no breakdown in the prior month?",
          "weight": 40,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    },
    {
      "id": "driver",
      "name": "Driver",
      "weight": 10,
      "items": [
        {
          "id": "drv_1",
          "description": "Does the vehicle have a designated driver responsible and owner?",
          "weight": 25,
          "order": 1,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "drv_2",
          "description": "Has the driver been trained per standards required?",
          "weight": 25,
          "order": 2,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "drv_3",
          "description": "Has the driver passed test per defined standards expected?",
          "weight": 25,
          "order": 3,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        },
        {
          "id": "drv_4",
          "description": "Is the tractor parked under shed by the driver overnight?",
          "weight": 25,
          "order": 4,
          "input_type": "select",
          "options": [
            { "label": "Good", "value": "good", "score_percent": 100, "color": "green" },
            { "label": "Repair", "value": "repair", "score_percent": 0, "color": "orange" },
            { "label": "Replace", "value": "replace", "score_percent": 0, "color": "red" }
          ],
          "require_photo_on": ["repair", "replace"],
          "require_note_on": ["repair", "replace"]
        }
      ]
    }
  ]
}