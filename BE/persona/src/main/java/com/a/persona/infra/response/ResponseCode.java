package com.a.persona.infra.response;

import org.springframework.http.HttpStatus;

public enum ResponseCode {
  OK("0000", HttpStatus.OK, "OK"),

  CONTINUE("1000", HttpStatus.CONTINUE, "Continue"),

  CREATED("2010", HttpStatus.CREATED, "Created"),

  BAD_REQUEST("4000", HttpStatus.BAD_REQUEST, "Bad Request."),

  UNAUTHORIZED("4010", HttpStatus.UNAUTHORIZED, "Authentication required"),
  BAD_CREDENTIAL("4011", HttpStatus.UNAUTHORIZED, "Wrong credentials."),
  INVALID_CODE("4012", HttpStatus.UNAUTHORIZED, "Invalid verification code"),
  NOT_EXIST_PRE_AUTH_CREDENTIAL("4013", HttpStatus.OK, "No authentication credentials were found in the request."),

  NOT_FOUND("4040", HttpStatus.NOT_FOUND, "Not found."),

  INTERNAL_SERVER_ERROR("5000", HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"),
  SECURITY_INCIDENT("6000", HttpStatus.OK, "An unusual login attempt has been detected.");

  private final String code;
  private final HttpStatus status;
  private final String message;

  ResponseCode(String code, HttpStatus status, String message) {
    this.code = code;
    this.status = status;
    this.message = message;
  }

  public String code() {
    return code;
  }

  public HttpStatus status() {
    return status;
  }

  public String message() {
    return message;
  }
}