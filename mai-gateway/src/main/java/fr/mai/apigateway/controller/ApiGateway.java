package fr.mai.apigateway.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.mai.apigateway.model.Audio;
import fr.mai.apigateway.model.Detection;
import fr.mai.apigateway.model.Language;
import fr.mai.apigateway.model.Translation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

enum Urls {
    LANGUAGES("/languages"), DETECT("/detect"), TRANSLATE("/translate"), TTS("/api/tts");

    private final String URL;

    private Urls(String url) { URL = url; }

    @Override
    public String toString() { return URL; }
}

@RestController
public class ApiGateway {

    private final String LIBRE_TRANSLATE_URL = "http://192.168.213.128:5000";
    private final String OPEN_TTS_URL = "http://192.168.213.128:5500";

    private final WebClient LIBRE_TRANSLATE_CLIENT = WebClient.create(LIBRE_TRANSLATE_URL);
    private final WebClient OPEN_TTS_CLIENT = WebClient.create(OPEN_TTS_URL);

    @GetMapping("/languages")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<Language[]> languages() {
        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Language[]> languageResponseEntity;
        ResponseEntity<String> stringResponseEntity = LIBRE_TRANSLATE_CLIENT.get().uri(uriBuilder -> uriBuilder
                .path(Urls.LANGUAGES.toString())
                .build()).retrieve().toEntity(String.class).cache().block();

        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Language[] languages = mapper.readValue(stringResponseEntity.getBody(), Language[].class);
                languageResponseEntity = new ResponseEntity<>(languages, stringResponseEntity.getStatusCode());
            } catch (JsonMappingException e) {
                throw new RuntimeException(e);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            languageResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return languageResponseEntity;
    }

    @GetMapping("/detect")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<Detection> detect(@RequestParam String text) {

        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Detection> detectionResponseEntity;
        ResponseEntity<String> stringResponseEntity = LIBRE_TRANSLATE_CLIENT.post().uri(uriBuilder -> uriBuilder
                .path(Urls.DETECT.toString())
                .queryParam("q", text)
                .build()).retrieve().toEntity(String.class).cache().block();

        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Detection[] detections = mapper.readValue(stringResponseEntity.getBody(), Detection[].class);
                if (detections.length > 0) {
                    detectionResponseEntity = new ResponseEntity<>(detections[0], stringResponseEntity.getStatusCode());
                } else {
                    detectionResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
                }
            } catch (JsonMappingException e) {
                throw new RuntimeException(e);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            detectionResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return detectionResponseEntity;
    }

    @GetMapping("/translate")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<Translation> translate(@RequestParam String sourceLang,
                                                 @RequestParam String targetLang,
                                                 @RequestParam String text) {
        ObjectMapper mapper = new ObjectMapper();

        ResponseEntity<Translation> translationResponseEntity;
        ResponseEntity<String> stringResponseEntity = LIBRE_TRANSLATE_CLIENT.post().uri(uriBuilder -> uriBuilder
                .path(Urls.TRANSLATE.toString())
                .queryParam("source", sourceLang)
                .queryParam("target", targetLang)
                .queryParam("q", text)
                .build()).retrieve().toEntity(String.class).cache().block();

        if (HttpStatus.OK.equals(stringResponseEntity.getStatusCode())) {
            try {
                Translation translation = mapper.readValue(stringResponseEntity.getBody(), Translation.class);
                translationResponseEntity = new ResponseEntity<>(translation, stringResponseEntity.getStatusCode());
            } catch (JsonMappingException e) {
                throw new RuntimeException(e);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            translationResponseEntity = new ResponseEntity<>(stringResponseEntity.getStatusCode());
        }

        return translationResponseEntity;
    }

    @GetMapping(value = "/tts")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<Audio> textToSpeech(@RequestParam String voice,
                                               @RequestParam String text,
                                               @RequestParam String vocoder,
                                               @RequestParam String denoiserStrength) {

        ResponseEntity<Audio> audioResponseEntity;

        ResponseEntity<byte[]> bytesResponseEntity = OPEN_TTS_CLIENT.get().uri(uriBuilder -> uriBuilder
                        .path(Urls.TTS.toString())
                        .queryParam("voice", voice)
                        .queryParam("text", text)
                        .queryParam("vocoder", vocoder)
                        .queryParam("denoiserStrength", denoiserStrength)
                        .queryParam("cache", Boolean.FALSE.toString())
                        .build()).retrieve().toEntity(byte[].class).cache().block();

        if (HttpStatus.OK.equals(bytesResponseEntity.getStatusCode())) {
            Audio audio = new Audio(bytesResponseEntity.getBody());
            audioResponseEntity = new ResponseEntity<>(audio, bytesResponseEntity.getStatusCode());
        } else {
            audioResponseEntity = new ResponseEntity<>(bytesResponseEntity.getStatusCode());
        }

        return audioResponseEntity;
    }
}
