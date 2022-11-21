package fr.mai.apigateway.model;

public class Audio {

    private byte[] bytes;

    public Audio() {
    }

    public Audio(byte[] bytes) {
        this.bytes = bytes;
    }

    public byte[] getBytes() {
        return bytes;
    }

    public void setBytes(byte[] bytes) {
        this.bytes = bytes;
    }
}
