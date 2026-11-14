import io
import math
import json
from typing import Optional, Tuple
from PIL import Image, ImageDraw, ImageFont

MARKER_START = b"<<<CPTX_CARRIER_V1>>>"
MARKER_END = b"<<</CPTX_CARRIER_V1>>>"

class SteganographyService:
    @staticmethod
    def is_carrier_image(data: bytes) -> bool:
        """Check if binary data contains a CryptX Steganographic Carrier container."""
        return MARKER_START in data and MARKER_END in data

    @staticmethod
    def extract_payload(data: bytes) -> Optional[bytes]:
        """Extract encapsulated cryptographic payload from a carrier image."""
        start_idx = data.find(MARKER_START)
        if start_idx == -1:
            return None
        start_pos = start_idx + len(MARKER_START)
        end_idx = data.find(MARKER_END, start_pos)
        if end_idx == -1:
            return None
        return data[start_pos:end_idx]

    @staticmethod
    def create_file_carrier_image(
        original_filename: str,
        file_size: int,
        sha256_hash: str,
        encrypted_payload: bytes,
    ) -> bytes:
        """
        Create a sleek visual 'Vault Asset Carrier Image' (PNG) that encapsulates any arbitrary
        encrypted document or archive. The resulting image is fully viewable in any standard image
        viewer, and contains the sealed payload for extraction.
        """
        width, height = 720, 420
        img = Image.new("RGB", (width, height), color=(8, 11, 18))
        draw = ImageDraw.Draw(img)

        # Draw outer cyber-security border
        draw.rounded_rectangle([15, 15, width - 15, height - 15], radius=16, outline=(0, 212, 255), width=2)
        draw.rounded_rectangle([22, 22, width - 22, height - 22], radius=12, outline=(30, 41, 59), width=1)

        # Title Header
        draw.text((45, 45), "CRYPTX ENCRYPTED VAULT ASSET CARRIER", fill=(0, 212, 255))
        draw.text((45, 75), "Confidentiality & Integrity Sealed with AES-256-GCM", fill=(148, 163, 184))

        # Horizontal divider
        draw.line([(45, 110), (width - 45, 110)], fill=(30, 41, 59), width=1)

        # Asset details
        draw.text((45, 130), f"ORIGINAL FILE:    {original_filename}", fill=(248, 250, 252))
        
        # Format size
        size_str = f"{file_size} Bytes"
        if file_size >= 1024 * 1024:
            size_str = f"{file_size / (1024 * 1024):.2f} MB"
        elif file_size >= 1024:
            size_str = f"{file_size / 1024:.2f} KB"
        draw.text((45, 165), f"PAYLOAD SIZE:     {size_str}", fill=(148, 163, 184))

        draw.text((45, 200), f"SHA-256 DIGEST:   {sha256_hash[:32]}...", fill=(0, 212, 255))
        draw.text((45, 235), "CONTAINER FORMAT: .cptx (Polyglot Steganographic PNG)", fill=(56, 189, 248))
        draw.text((45, 270), "ENCRYPTION MODE:  AES-256-GCM + NIST RFC 3394 Server KEK", fill=(16, 185, 129))

        # Bottom Instructions
        draw.line([(45, 310), (width - 45, 310)], fill=(30, 41, 59), width=1)
        draw.text(
            (45, 335),
            "INSTRUCTIONS: Upload this PNG into CryptX Vault or File Decryption console",
            fill=(251, 191, 36),
        )
        draw.text(
            (45, 360),
            "to extract and restore the exact original document.",
            fill=(148, 163, 184),
        )

        # Render PNG bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        base_png = buf.getvalue()

        # Append sealed carrier payload
        return base_png + MARKER_START + encrypted_payload + MARKER_END

    @staticmethod
    def create_image_cipher_carrier(
        original_filename: str,
        encrypted_payload: bytes,
    ) -> bytes:
        """
        Create a visual cipher image (diffused cryptographic noise canvas) that visually
        represents the encrypted image while embedding the complete bit-exact ciphertext stream.
        """
        # Determine visual dimensions from ciphertext length (clamped to a nice 16:9 or square grid)
        data_len = len(encrypted_payload)
        num_pixels = max(40000, min(data_len // 3, 250000))  # Between 200x200 and 500x500
        side = int(math.isqrt(num_pixels))
        
        # Build pixel bytes from the real encrypted payload (wrapped or repeating to fill the canvas)
        needed = side * side * 3
        if len(encrypted_payload) >= needed:
            pixel_bytes = encrypted_payload[:needed]
        else:
            repeats = (needed // len(encrypted_payload)) + 1
            pixel_bytes = (encrypted_payload * repeats)[:needed]

        img = Image.frombytes("RGB", (side, side), pixel_bytes)
        
        # Add visual cryptographic overlay watermark banner
        draw = ImageDraw.Draw(img)
        # Top banner
        draw.rectangle([0, 0, side, 35], fill=(8, 11, 18))
        draw.text((10, 10), "CRYPTX VISUAL CIPHER IMAGE", fill=(0, 212, 255))
        
        # Bottom banner
        draw.rectangle([0, side - 30, side, side], fill=(8, 11, 18))
        draw.text((10, side - 22), "SEALED WITH AES-256-GCM • DECRYPT VIA CRYPTX", fill=(56, 189, 248))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        base_png = buf.getvalue()

        # Append sealed carrier payload
        return base_png + MARKER_START + encrypted_payload + MARKER_END

steganography_service = SteganographyService()
