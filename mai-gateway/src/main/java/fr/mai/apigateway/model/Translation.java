package fr.mai.apigateway.model;

public class Translation {

    private String translatedText;

    public Translation() {

    }

    public Translation(String translatedText) {
        this.translatedText = translatedText;
    }

    public String getTranslatedText() {
        return translatedText;
    }

    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
    }
}
