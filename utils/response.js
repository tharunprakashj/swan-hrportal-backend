/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');

class Response {
  constructor(response, status = 200) {
    this.response = response;
    this.status = status;
  }

  ErrorMessage(message, error) {
    if (!this.status) {
      this.status = StatusCodes.OK;
    }
    this.response.status(this.status).send({
      status: false,
      message,
      error,
    });
  }

  ErrorMessageWithData(message, data) {
    if (!this.status) {
      this.status = StatusCodes.OK;
    }
    this.response.status(this.status).send({
      status: false,
      message,
      data,
    });
  }

  LoginResponse(user, token) {
    this.response.status(this.status).send({
      status: true,
      message: 'Login success !!',
      data: user,
      auth: token,
    });
  }

  SuccessResponse(message, data, token = undefined) {
    this.response.status(this.status).send({
      status: true,
      message,
      data,
      token,
    });
  }

  SuccessCreationResponse(message, request_id) {
    this.response.status(this.status).send({
      status: true,
      message,
      request_id,
    });
  }

  SuccessResponsedoubleData(message, data, documents) {
    this.response.status(this.status).send({
      status: true,
      message,
      data,
      documents,
    });
  }

  SuccessResponseData(message, datatwo, dataThree, dataFour, dataFive) {
    this.response.status(this.status).send({
      status: true,
      message,
      role: datatwo,
      statusType: dataThree,
      documentType: dataFour,
      requestType: dataFive,
    });
  }
}

module.exports = Response;
