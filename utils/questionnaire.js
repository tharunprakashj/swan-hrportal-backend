/* eslint-disable no-trailing-spaces */
const Questionnaire = {
  questionnaire: [
    {
      sectionId: 1,
      title: 'QUESTIONNAIRE',
      questions: [
        {
          questionId: 1,
          questionType: 'main',
          subQuestion: null,
          question: 'Have you or any of your dependants listed in Section B ever had or been told that you or any of them suffered from or been treatred from any of the following',
          type: 'txt',
          answer: null,
          answer_status: null,
          subquestions: [
            {
              questionId: 2,
              questionType: 'sub',
              subQuestion: 1,
              rowBy: 'a',
              question: 'High blood pressure vascular/heart diseases',
              type: 'radio',
              // options: ['Yes', 'No'],
              options: [
                {
                  id: 1,
                  field: 'Yes',
                },
                {
                  id: 2,
                  field: 'No',
                },
              ],
              answer_status: null,
              answer: null,
            },
            {
              questionId: 3,
              questionType: 'sub',
              subQuestion: 1,
              rowBy: 'b',
              question: 'Diabetes, kidney or liver diseases',
              type: 'radio',
              // options: ['Yes', 'No'],
              options: [
                {
                  id: 1,
                  field: 'Yes',
                },
                {
                  id: 2,
                  field: 'No',
                },
              ],
              answer_status: null,
              answer: null,
            },
            {
              questionId: 4,
              questionType: 'sub',
              subQuestion: 1,
              rowBy: 'c',
              question: 'Cancer or any malignant diseases',
              type: 'radio',
              // options: ['Yes', 'No'],
              options: [
                {
                  id: 1,
                  field: 'Yes',
                },
                {
                  id: 2,
                  field: 'No',
                },
              ],
              answer_status: null,
              answer: null,
            },
            {
              questionId: 5,
              questionType: 'sub',
              subQuestion: 1,
              rowBy: 'd',
              question: 'Epilepsy, mental or nervous disorder',
              type: 'radio',
              // options: ['Yes', 'No'],
              options: [
                {
                  id: 1,
                  field: 'Yes',
                },
                {
                  id: 2,
                  field: 'No',
                },
              ],
              answer_status: null,
              answer: null,
            },
            {
              questionId: 6,
              questionType: 'sub',
              subQuestion: 1,
              rowBy: 'e',
              question: 'Lung diseases',
              type: 'radio',
              // options: ['Yes', 'No'],
              options: [
                {
                  id: 1,
                  field: 'Yes',
                },
                {
                  id: 2,
                  field: 'No',
                },
              ],
              answer_status: null,
              answer: null,
            },
          ],
        },
        
        {
          questionId: 7,
          questionType: 'main',
          subQuestion: null,
          question: 'Have you or any of your dependants listed in B ever had any special XRAY/SCAN or investigation carried out on the recommended of a doctor',
          type: 'radio',
          // options: ['Yes', 'No'],
          options: [
            {
              id: 1,
              field: 'Yes',
            },
            {
              id: 2,
              field: 'No',
            },
          ],
          answer: null,
          answer_status: null,
          subquestions: [
            // {
            //   questionId: 10,
            //   questionType: 'sub',
            //   subQuestion: 1,
            //   rowBy: 'a',
            //   question: 'Testing High blood pressure vascular/heart diseases',
            //   type: 'radio',
            //   // options: ['Yes', 'No'],
            //   options: [
            //     {
            //       id: 1,
            //       field: 'Yes',
            //     },
            //     {
            //       id: 2,
            //       field: 'No',
            //     },
            //   ],
            //   answer_status: null,
            //   answer: null,
            // },
            // {
            //   questionId: 11,
            //   questionType: 'sub',
            //   subQuestion: 1,
            //   rowBy: 'b',
            //   question: 'Testing Diabetes, kidney or liver diseases',
            //   type: 'radio',
            //   // options: ['Yes', 'No'],
            //   options: [
            //     {
            //       id: 1,
            //       field: 'Yes',
            //     },
            //     {
            //       id: 2,
            //       field: 'No',
            //     },
            //   ],
            //   answer_status: null,
            //   answer: null,
            // },
          ],
        },
        {
          questionId: 8,
          questionType: 'main',
          subQuestion: null,
          question: "Have you or any of your dependants listed in B received a doctor's advice or treatment for any medical condition within the last 12 months from the date of this ?",
          type: 'radio',
          // options: ['Yes', 'No'],
          options: [
            {
              id: 1,
              field: 'Yes',
            },
            {
              id: 2,
              field: 'No',
            },
          ],
          answer: null,
          answer_status: null,
          subquestions: [],
        },
        {
          questionId: 9,
          questionType: 'main',
          subQuestion: null,
          question: 'Have you or any of your dependants listed in B been advised to follow in the future a specific treatment or to undergo a special operation in relation to any existing medical condition',
          type: 'radio',
          // options: ['Yes', 'No'],
          options: [
            {
              id: 1,
              field: 'Yes',
            },
            {
              id: 2,
              field: 'No',
            },
          ],
          answer_status: null,
          answer: null,
          subquestions: [],
        },
      ],
    },
  ],
};

const doctorQuestions = {
  health_report: [
    {
      question: 'Choose Member',
      key: 'forename',
      type: 'dropdown',
      mandatory: 'yes',
      answer: null,

    },
    {
      question: 'Date of first consultation',
      key: 'first_consulting',
      type: 'datepicker',
      mandatory: 'yes',
      answer: null,

    },
    {
      question: 'Specify exact nature of illness',
      key: 'specify',
      type: 'textbox',
      mandatory: 'yes',
      answer: null,

    },
    {
      question: 'Duration of illness',
      key: 'illness_duration',
      type: 'dropdown',
      mandatory: 'yes',
      answer: null,

    },
    {
      question: 'Doctor Name',
      key: 'doctor_name',
      type: 'textbox',
      mandatory: 'yes',
      answer: null,

    },
    {
      question: 'Doctor No',
      key: 'doctor_number',
      type: 'textbox',
      answer: null,

    },
    {
      question: 'Doctor Address 1',
      key: 'doctor_address1',
      type: 'dropdown',
      answer: null,

    },
    {
      question: 'Doctor Address 2',
      key: 'doctor_address2',
      type: 'dropdown',
      answer: null,

    },
  ],
}; 

module.exports = { 
  Questionnaire,
  doctorQuestions,
};
