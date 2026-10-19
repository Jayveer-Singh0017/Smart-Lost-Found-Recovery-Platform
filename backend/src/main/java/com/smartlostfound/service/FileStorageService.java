package com.smartlostfound.service;

import com.smartlostfound.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path fileStorageLocation;
    private final Set<String> allowedExtensions;

    public FileStorageService(
            @Value("${app.upload.dir:./uploads}") String uploadDir,
            @Value("${app.upload.allowed-extensions:jpg,jpeg,png,webp}") String allowedExtensionsStr) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.allowedExtensions = new HashSet<>(Arrays.asList(allowedExtensionsStr.toLowerCase().split(",")));

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            logger.error("Could not create storage directory at {}", this.fileStorageLocation, ex);
            throw new RuntimeException("Could not create the directory where uploaded files will be stored", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        if (rawOriginalFilename == null || rawOriginalFilename.isBlank()) {
            throw new BadRequestException("File name cannot be empty");
        }

        // Clean filename and defend against path traversal
        String originalFilename = StringUtils.cleanPath(rawOriginalFilename);
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + rawOriginalFilename);
        }

        // Validate extension
        String extension = getFileExtension(originalFilename);
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new BadRequestException("File type not allowed. Supported extensions: " + allowedExtensions);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Uploaded file must be a valid image");
        }

        // Generate safe unique storage filename
        String storageFileName = UUID.randomUUID() + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(storageFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storageFileName;
        } catch (IOException ex) {
            logger.error("Failed to store file {}", storageFileName, ex);
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            // Guard against directory traversal
            String cleanFileName = StringUtils.cleanPath(fileName);
            if (cleanFileName.contains("..") || cleanFileName.contains("/") || cleanFileName.contains("\\")) {
                throw new BadRequestException("Invalid filename sequence");
            }

            Path filePath = this.fileStorageLocation.resolve(cleanFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("File not found: " + fileName);
        }
    }

    public boolean deleteFile(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return false;
        }
        try {
            String cleanFileName = StringUtils.cleanPath(fileName);
            if (cleanFileName.contains("..") || cleanFileName.contains("/") || cleanFileName.contains("\\")) {
                return false;
            }
            Path filePath = this.fileStorageLocation.resolve(cleanFileName).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            logger.warn("Could not delete file: {}", fileName, ex);
            return false;
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
