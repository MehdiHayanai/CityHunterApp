from typing import List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CityHunter Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    MONGO_URI: str
    DB_NAME: str

    API_KEY: str
    GEMINI_API_KEY: str
    FRONT_URL: str

    # Email / Resend
    RESEND_API_KEY: str
    EMAIL_FROM: str = "CityHunter <onboarding@resend.dev>"

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]], info) -> List[str]:
        # Get FRONT_URL from the data being validated
        front_url = info.data.get("FRONT_URL", "")

        # Default origins
        default_origins = [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
        ]

        # Add FRONT_URL if it exists
        if front_url:
            # Remove trailing slash for consistency
            front_url = front_url.rstrip("/")
            if front_url not in default_origins:
                default_origins.append(front_url)

        # If v is provided, parse it and merge with defaults
        if v:
            if isinstance(v, str) and not v.startswith("["):
                custom_origins = [i.strip() for i in v.split(",")]
            elif isinstance(v, str) and v.startswith("["):
                import json

                custom_origins = json.loads(v)
            elif isinstance(v, list):
                custom_origins = v
            else:
                raise ValueError(v)

            # Merge custom origins with defaults (avoid duplicates)
            for origin in custom_origins:
                if origin not in default_origins:
                    default_origins.append(origin)

        return default_origins

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, env_ignore_empty=True, extra="ignore"
    )


settings = Settings()
