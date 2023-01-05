package fr.mai.apigateway.model;

import com.fasterxml.jackson.annotation.JsonFilter;

@JsonFilter("targets")
public class Language {

    private String code;

    private String name;

    public Language() {

    }

    public Language(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
