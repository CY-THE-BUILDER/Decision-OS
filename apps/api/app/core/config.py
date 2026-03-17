from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Decision OS API"
    app_env: str = "development"
    app_version: str = "0.1.0"
    app_base_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:3001"
    openai_api_key: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    jwt_audience: str = "authenticated"
    timezone: str = "Asia/Taipei"
    confidence_threshold: float = 0.6
    demo_mode: bool = False
    data_dir: str = "./data"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_environment(self) -> "Settings":
        if self.app_env == "production":
            required = {
                "APP_BASE_URL": self.app_base_url,
                "SUPABASE_URL": self.supabase_url,
                "SUPABASE_ANON_KEY": self.supabase_anon_key,
                "SUPABASE_SERVICE_ROLE_KEY": self.supabase_service_role_key,
            }
            missing = [key for key, value in required.items() if not value]
            if missing:
                raise ValueError(f"Missing required production settings: {', '.join(missing)}")
        return self


settings = Settings()
if settings.app_env != "production" and not settings.supabase_url:
    settings.demo_mode = True
