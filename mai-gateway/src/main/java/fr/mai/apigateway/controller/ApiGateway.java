package fr.mai.apigateway.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.mai.apigateway.model.Audio;
import fr.mai.apigateway.model.Detection;
import fr.mai.apigateway.model.Language;
import fr.mai.apigateway.model.Translation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.PostConstruct;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

enum Urls {
    LANGUAGES("/languages"), DETECT("/detect"), TRANSLATE("/translate"), TTS("/api/tts");

    private final String URL;

    Urls(String url) { URL = url; }

    @Override
    public String toString() { return URL; }
}

enum Voices {
    ESPEAK("espeak");

    private final String VOICE;

    Voices(String voice) { VOICE = voice; }

    @Override
    public String toString() { return VOICE; }
}

enum Vocoders {
    HIGH("high");

    private final String VOCODER;

    Vocoders(String vocoder) { VOCODER = vocoder; }

    @Override
    public String toString() { return VOCODER; }
}

@Component
@CrossOrigin
@RestController
public class ApiGateway {

    private final Double DENOISER_STRENGTH = 0.03;
    private WebClient libreTranslateClient;
    private WebClient openTtsClient;

    @PostConstruct
    public void createClients() throws NamingException {
        String libreTranslateUrl = System.getenv("LIBRE_TRANSLATE_URL");
        String openTtsUrl= System.getenv("OPEN_TTS_URL");;

        libreTranslateClient = WebClient.create(libreTranslateUrl);
        openTtsClient = WebClient.create(openTtsUrl);
    }

    @GetMapping("/languages")
    public ResponseEntity<Language[]> languages() {
        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Language[]> languageResponseEntity;
        ResponseEntity<String> stringResponseEntity = libreTranslateClient.get().uri(uriBuilder -> uriBuilder
                .path(Urls.LANGUAGES.toString())
                .build()).retrieve().toEntity(String.class).cache().block();

        assert stringResponseEntity != null;
        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Language[] languages = mapper.readValue(stringResponseEntity.getBody(), Language[].class);
                languageResponseEntity = new ResponseEntity<>(languages, stringResponseEntity.getStatusCode());
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            languageResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return languageResponseEntity;
    }

    @GetMapping("/detect")
    public ResponseEntity<Detection> detect(@RequestParam String text) {

        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Detection> detectionResponseEntity;
        ResponseEntity<String> stringResponseEntity = libreTranslateClient.post().uri(uriBuilder -> uriBuilder
                .path(Urls.DETECT.toString())
                .queryParam("q", text)
                .build()).retrieve().toEntity(String.class).cache().block();

        assert stringResponseEntity != null;
        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Detection[] detections = mapper.readValue(stringResponseEntity.getBody(), Detection[].class);
                if (detections.length > 0) {
                    detectionResponseEntity = new ResponseEntity<>(detections[0], stringResponseEntity.getStatusCode());
                } else {
                    detectionResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
                }
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            detectionResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return detectionResponseEntity;
    }

    @GetMapping("/translate")
    public ResponseEntity<Translation> translate(@RequestParam String sourceLanguageCode,
                                                 @RequestParam String targetLanguageCode,
                                                 @RequestParam String text) {
        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Translation> translationResponseEntity;
        ResponseEntity<String> stringResponseEntity = libreTranslateClient.post().uri(uriBuilder -> uriBuilder
                .path(Urls.TRANSLATE.toString())
                .queryParam("source", sourceLanguageCode)
                .queryParam("target", targetLanguageCode)
                .queryParam("q", text)
                .build()).retrieve().toEntity(String.class).cache().block();

        assert stringResponseEntity != null;
        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Translation translation = mapper.readValue(stringResponseEntity.getBody(), Translation.class);
                translationResponseEntity = new ResponseEntity<>(translation, stringResponseEntity.getStatusCode());
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            translationResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return translationResponseEntity;
    }

    @GetMapping(value = "/tts")
    public ResponseEntity<Audio> textToSpeech(@RequestParam String sourceLanguageCode,
                                               @RequestParam String text) {

        ResponseEntity<Audio> audioResponseEntity;

        ResponseEntity<byte[]> bytesResponseEntity = openTtsClient.get().uri(
                uriBuilder -> uriBuilder
                        .path(Urls.TTS.toString())
                        .queryParam("voice", String.join(":", Voices.ESPEAK.toString(), sourceLanguageCode))
                        .queryParam("text", text)
                        .queryParam("vocoder", Vocoders.HIGH.toString())
                        .queryParam("denoiserStrength", Double.toString(DENOISER_STRENGTH))
                        .queryParam("cache", Boolean.FALSE.toString())
                        .build()).retrieve().toEntity(byte[].class).cache().block();

        if (bytesResponseEntity != null && HttpStatus.OK.equals(bytesResponseEntity.getStatusCode())) {
            Audio audio = new Audio(bytesResponseEntity.getBody());
            audioResponseEntity = new ResponseEntity<>(audio, bytesResponseEntity.getStatusCode());
        } else if (bytesResponseEntity != null) {
            audioResponseEntity = new ResponseEntity<>(bytesResponseEntity.getStatusCode());
        } else {
            audioResponseEntity = new ResponseEntity<>(HttpStatus.FAILED_DEPENDENCY);
        }

        return audioResponseEntity;
    }
}
