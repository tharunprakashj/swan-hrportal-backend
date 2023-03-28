module.exports.Message = {

  UserManagement: {
    SuccessMessage: {
      Create: 'User created successfully !',
      Update: 'User updated successfully !',
      Delete: 'User deleted successfully !',
      Login: 'Login successfull !',
      Fetch: 'Users fetched !',
      Mail: 'Email sent successfully !',
      OtpVerify: 'Otp verified successfully !',
      Password: 'Password updated successfully !',
    },
    FailureMessage: {
      Create: 'User creation failed, kindly retry !',
      Update: 'User updation failed, kindly retry !',
      Delete: 'User deletion failed, kindly retry !',
      Login: 'Login failed !',
      NotFound: 'User not found !',
      OtpVerifyFailed: 'Invalid Otp',
      PasswordFailed: 'You have entered wrong old password!',
      PasswordNotSame: 'Password is not same',
      Invalid: 'Invalid username or password',
      Password: 'Wrong Password, try again or click forget password to reset',
      ValidEmail: 'Please enter valid email and password',
      EnterEmail: 'Please enter the valid email id !',
      EnterRole: 'Access Denied for this login',
      EnterPassword: 'Please Enter the valid password !',
      ServerError: 'Server Error',
      InvalidRole: 'Invalid Login Credentials',
    },
  },
  CompanyManagement: {
    SuccessMessage: {
      Create: 'Company created successfully',
      Existing: 'Company already existing !',
    },
    FailureMessage: {
    },
  },
  Token: {
    SuccessMessage: {
      RevokeToken: 'Token revoked',
      RefreshToken: 'Session created and new token generated !',
    },
    FailureMessage: {
      RevokeToken: 'Token revoke failed !',
      Config: 'Token configuration error !',
      RefreshToken: 'Refresh token generation failed !!',
      Created: 'JWT Token is not created',
    },
  },
  Common: {
    SuccessMessage: {
      Fetch(data = 'Data') {
        return `${data} fetched successfully !`;
      },

      Creation(data = 'Data') {
        return `${data} created successfully !`;
      },
      Updation(data = 'Data') {
        return `${data} updated successfully !`;
      },
      Deletion(data = 'Data') {
        return `${data} deleted successfully !`;
      },
      NoData(data = 'Data') {
        return `No ${data} found !`;
      },
      swanApproval(data = 'Data') {
        return `${data} request has been Approved!`;
      },
      NextPage(data = 'Data') {
        return `${data} is updated, move to next page`;
      },
      forgotPassword: 'OTP has been send to registerded Email Id',
      hrApproval: 'You have Successfully submitted your request for HR Approval!',
      swanSubmit: 'You have Successfully submitted your request for Swan Approval!',
      rejected: 'Request has been rejected',
      backHr: 'Request is returned back to HR for Additional Information',
      backEmployee: 'Request is returned back to Employee for Additional Information',
      otp: 'OTP has been verified Successfully',
      sendMailToAll: 'Mail sended to all users successfully',
    },
    FailureMessage: {
      Fetch(data = 'Data') {
        return `${data} fetch failed, kindly retry !! `;
      },

      Creation(data = 'Data') {
        return `${data} creation failed, kindly retry !!`;
      },
      Updation(data = 'Data') {
        return `${data} updation failed, kindly retry !!`;
      },
      Existing(data = 'Data') {
        return `${data} Already Exist !`;
      },
      Deletion(data = 'Data') {
        return `${data} deletion failed, kindly retry !!`;
      },
      NoDataFound(data = 'Data') {
        return `No ${data} found !!`;
      },
      NotFound(data = 'Data') {
        return `${data} not found !!`;
      },
      uploadedDocument(data = 'Data') {
        return `Please upload ${data}`;
      },
      Unauthorized: 'Unauthorized !',
      noAccess: 'You dont have access to this url',
      UrlNotValid: 'URL not found',
      Empty: 'Received an Empty Array',
      loginPlease: 'Session Expired, Please Login !',
      NoData: 'No data found !',
      SomethingWnWrng: 'Something went wrong we are trying to fix it. Please try again later !',
      TokenExpired: 'Login expired !',
      InternalServerError: 'Internal server error. Please try again later !',
      cancelRequest: 'Request cant be cancelled after submitting',
      DataAlreadyExists: 'Data already exists !',
      userEmail: 'User Created and Email Sending Failed',
      access: 'You dont have the access',
      InvalidUser: 'Invalid username or password !',
      imageFailed: 'Employee Details updated succesfully, Failed to upload Images',
      documentFailed: 'Employee Details updated succesfully, Failed to upload documents',
      invalidData: 'Received an invalid Data',
      uploads: 'Please upload missing documents',
      otp: 'Failed to send OTP',
      otpVerification: 'Otp Verification failed',
      misMatchInsuranceDate: 'Effective insurance date mis-match with employment date',
      questionnarie: 'Failed to add answers to questionaries',
      requiredData: 'Not received all the required data',
      requestId: 'Request is not valid',
      noChanges: 'No changes found to update',
      pendingRequest: 'You cannot add another request before a request completed',
      hrExists: 'Sub-HR already exists !',
    },
  },
  notifications: {
    submit: 'submitted the request for HR Approval',
    hrSubmit: 'submitted the request for SWAN Approval',
    addInfo: 'asked for additional info',
    approved: ' approved the request',
    rejected: 'rejected the request',
    assisgned: 'is assisgned to',
    comments: ' is mentioned you in comment',

  },
};
