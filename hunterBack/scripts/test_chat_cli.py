import os

import requests
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt

API_BASE_URL = "http://localhost:8000/api/v1"


def login(console):
    """
    Prompts user for credentials and logs in to get the token and user_id.
    """
    console.print("[bold cyan]Please Log In[/bold cyan]")
    email = Prompt.ask("Email", default="hunter@example.com")
    password = Prompt.ask("Password", password=True, default="password")

    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login", json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        token = data.get("access_token")
        user_id = data.get("user_id")  # Assuming the endpoint returns user_id

        # If user_id is not returned directly, we might need to fetch /users/me
        # But looking at auth.py, it returns "user_id": str(user.id)

        console.print(f"[green]Login Successful! User ID: {user_id}[/green]")
        return token, user_id
    except Exception as e:
        console.print(f"[bold red]Login Failed:[/bold red] {e}")
        return None, None


def main():
    console = Console()

    console.print(
        Panel.fit(
            "[bold blue]Monumentum CLI Tester[/bold blue]\n"
            "[dim]Connected to local API[/dim]",
            border_style="cyan",
        )
    )

    # Login Step
    token, user_id = login(console)
    if not token:
        return

    # create session
    try:
        session_id = f"cli_{os.getpid()}"
        # We can pass the user_id from login
        response = requests.post(
            f"{API_BASE_URL}/chat/sessions",
            json={"user_id": user_id, "session_id": session_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()
        console.print(f"[green]Session Created: {session_id}[/green]")
    except Exception as e:
        console.print(f"[bold red]Failed to create session:[/bold red] {e}")
        return

    while True:
        try:
            user_text = Prompt.ask("\n[bold green]User[/bold green]")

            if user_text.lower() in ["exit", "quit"]:
                break

            # Send message
            payload = {
                "message": user_text,
                "user_id": user_id,
            }

            # Optional: Ask for location override or use default
            use_loc = Prompt.ask("Include Location?", choices=["y", "n"], default="n")
            if use_loc == "y":
                lat = float(Prompt.ask("Lat", default="48.8584"))
                lon = float(Prompt.ask("Lon", default="2.2945"))
                payload["location"] = {"lat": lat, "lon": lon}

            with console.status(
                "[bold cyan]Agent is thinking...[/bold cyan]", spinner="dots"
            ):
                resp = requests.post(
                    f"{API_BASE_URL}/chat/sessions/{session_id}/messages",
                    json=payload,
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
                agent_response = data.get("response", "")

            console.print("\n[bold blue]Monumentum[/bold blue]:")
            console.print(Markdown(agent_response))

        except KeyboardInterrupt:
            break
        except Exception as e:
            console.print(f"[bold red]Error:[/bold red] {e}")


if __name__ == "__main__":
    main()
