import io
import math
import json
import random
from typing import Optional, Tuple
from PIL import Image, ImageDraw

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
        draw.text((45, 235), "CONTAINER FORMAT: .carrier.png (Polyglot Carrier PNG)", fill=(56, 189, 248))
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

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        base_png = buf.getvalue()

        return base_png + MARKER_START + encrypted_payload + MARKER_END

    @staticmethod
    def _generate_scenic_image(width: int = 720, height: int = 480) -> Image.Image:
        """Generate a serene twilight mountain sunset landscape."""
        img = Image.new("RGB", (width, height))
        draw = ImageDraw.Draw(img)

        # Twilight purple-to-warm-sunset gradient
        for y in range(height):
            t = y / height
            r = int(18 * (1 - t) + 245 * t * 0.75)
            g = int(24 * (1 - t) + 120 * t * 0.5)
            b = int(58 * (1 - t) + 30 * t * 0.25)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Stars in upper sky
        rnd = random.Random(1337)
        for _ in range(120):
            sx = rnd.randint(0, width)
            sy = rnd.randint(0, int(height * 0.55))
            sb = rnd.randint(180, 255)
            draw.point((sx, sy), fill=(sb, sb, sb))

        # Glowing Moon
        mx, my, mr = width - 140, 85, 32
        draw.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(255, 252, 230))
        draw.ellipse([mx - mr + 12, my - mr - 4, mx + mr + 12, my + mr - 4], fill=(25, 28, 55))

        # Mountain layer 1 (distant mist)
        pts1 = [(0, height * 0.62)]
        for x in range(0, width + 40, 40):
            y = height * 0.55 + math.sin(x * 0.015) * 35 + math.cos(x * 0.03) * 15
            pts1.append((x, y))
        pts1.extend([(width, height), (0, height)])
        draw.polygon(pts1, fill=(55, 42, 85))

        # Mountain layer 2 (mid-range ridge)
        pts2 = [(0, height * 0.72)]
        for x in range(0, width + 30, 30):
            y = height * 0.65 + math.sin(x * 0.02 + 2) * 45 + math.cos(x * 0.01) * 20
            pts2.append((x, y))
        pts2.extend([(width, height), (0, height)])
        draw.polygon(pts2, fill=(30, 24, 52))

        # Mountain layer 3 (foreground dark silhouette)
        pts3 = [(0, height * 0.85)]
        for x in range(0, width + 20, 20):
            y = height * 0.78 + math.sin(x * 0.03 + 4) * 30
            pts3.append((x, y))
        pts3.extend([(width, height), (0, height)])
        draw.polygon(pts3, fill=(14, 12, 28))

        # Pine tree silhouettes on foreground
        for px in range(20, width - 20, 60):
            py = int(height * 0.78 + math.sin(px * 0.03 + 4) * 30)
            th = rnd.randint(25, 45)
            draw.polygon([(px, py - th), (px - 10, py), (px + 10, py)], fill=(8, 7, 18))

        return img

    @staticmethod
    def _generate_cyber_image(width: int = 720, height: int = 480) -> Image.Image:
        """Generate a synthwave/cyberpunk retro neon grid landscape."""
        img = Image.new("RGB", (width, height), color=(10, 10, 26))
        draw = ImageDraw.Draw(img)

        # Deep cosmic sky gradient
        horizon = int(height * 0.55)
        for y in range(horizon):
            t = y / horizon
            r = int(12 * (1 - t) + 120 * t)
            g = int(8 * (1 - t) + 18 * t)
            b = int(40 * (1 - t) + 95 * t)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Neon Sun on horizon
        sun_x, sun_y, sun_r = width // 2, horizon - 20, 75
        draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=(255, 60, 140))
        # Sun horizontal stripes
        for sy in range(sun_y - 20, sun_y + sun_r, 12):
            draw.line([(sun_x - sun_r - 10, sy), (sun_x + sun_r + 10, sy)], fill=(10, 10, 26), width=3)

        # Synthwave Grid Floor
        draw.rectangle([0, horizon, width, height], fill=(8, 6, 20))
        # Horizontal perspective grid lines
        for i in range(1, 14):
            gy = horizon + int(math.pow(i / 13, 1.8) * (height - horizon))
            draw.line([(0, gy), (width, gy)], fill=(0, 212, 255), width=1)

        # Vertical perspective converging lines
        vanishing_x, vanishing_y = width // 2, horizon
        for vx in range(-width // 2, width + width // 2, 70):
            draw.line([(vanishing_x, vanishing_y), (vx, height)], fill=(255, 0, 128), width=1)

        return img

    @classmethod
    def create_image_decoy_carrier(
        cls,
        original_filename: str,
        encrypted_payload: bytes,
        style: str = "scenic",
    ) -> bytes:
        """
        Create a completely different visual cover/decoy image (PNG) containing the
        sealed encrypted original photo.
        Styles supported:
          - 'scenic': Serene twilight mountain sunset wallpaper (Default)
          - 'cyber': Retro-synthwave neon cyberpunk grid
          - 'noise': Cryptographic visual cipher canvas
        """
        if style == "cyber":
            img = cls._generate_cyber_image()
        elif style == "noise":
            # Generate visual cipher from ciphertext bytes
            data_len = len(encrypted_payload)
            num_pixels = max(40000, min(data_len // 3, 250000))
            side = int(math.isqrt(num_pixels))
            needed = side * side * 3
            if len(encrypted_payload) >= needed:
                pixel_bytes = encrypted_payload[:needed]
            else:
                repeats = (needed // len(encrypted_payload)) + 1
                pixel_bytes = (encrypted_payload * repeats)[:needed]
            img = Image.frombytes("RGB", (side, side), pixel_bytes)
        else:
            # Default scenic
            img = cls._generate_scenic_image()

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        base_png = buf.getvalue()

        return base_png + MARKER_START + encrypted_payload + MARKER_END

    @classmethod
    def create_image_cipher_carrier(
        cls,
        original_filename: str,
        encrypted_payload: bytes,
    ) -> bytes:
        """Backward compatible helper: defaults to scenic decoy cover."""
        return cls.create_image_decoy_carrier(
            original_filename=original_filename,
            encrypted_payload=encrypted_payload,
            style="scenic",
        )

steganography_service = SteganographyService()
