import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import vertexai
from absl import app, flags
from dotenv import load_dotenv
from vertexai import agent_engines
from vertexai.preview.reasoning_engines import AdkApp
from server.orchestrator_agent.agent import root_agent
import json
FLAGS = flags.FLAGS
flags.DEFINE_string("project_id", None, "GCP project ID.")
flags.DEFINE_string("location", None, "GCP location.")
flags.DEFINE_string("bucket", None, "GCP bucket.")
flags.DEFINE_string("resource_id", None, "ReasoningEngine resource ID.")
flags.DEFINE_string("user_id", "test_user", "User ID for session operations.")
flags.DEFINE_string("session_id", None, "Session ID for operations.")
flags.DEFINE_bool("create", False, "Creates a new deployment.")
flags.DEFINE_bool("delete", False, "Deletes an existing deployment.")
flags.DEFINE_bool("list", False, "Lists all deployments.")
flags.DEFINE_bool("create_session", False, "Creates a new session.")
flags.DEFINE_bool("list_sessions", False, "Lists all sessions for a user.")
flags.DEFINE_bool("get_session", False, "Gets a specific session.")
flags.DEFINE_bool("send", False, "Sends a message to the deployed agent.")
flags.DEFINE_bool("send_stream", False, "Sends a streaming message to the deployed agent.")
flags.DEFINE_string(
    "message",
    "Shorten this message: Hello, how are you doing today?",
    "Message to send to the agent.",
)
flags.mark_bool_flags_as_mutual_exclusive(
    [
        "create",
        "delete",
        "list",
        "create_session",
        "list_sessions",
        "get_session",
        "send",
        "send_stream",
    ]
)


def create() -> None:
    """Creates an agent engine for Academic Research."""
    try:
        adk_app = AdkApp(agent=root_agent, enable_tracing=True)

        remote_agent = agent_engines.create(
            adk_app,
            display_name=root_agent.name,
            requirements=[
                "google-adk==1.3.0",
                "google-cloud-aiplatform[agent_engines]==1.97.0",
                "google-genai==1.20.0",
                "pydantic==2.11.7",
                "absl-py==2.3.0",
                "litellm==1.72.6",
                "cloudpickle==3.1.1",
                "cloudinary==1.44.1",
                "pillow==11.2.1",
                "python-dotenv==1.1.0"
            ],
            extra_packages=["./server"],
            env_vars={
                "AZURE_API_KEY": os.getenv("AZURE_API_KEY"),
                "AZURE_API_BASE": os.getenv("AZURE_API_BASE"),
                "AZURE_API_VERSION": os.getenv("AZURE_API_VERSION", "2025-01-01-preview"),
                "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY"),
                "CLOUDINARY_CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
                "CLOUDINARY_API_KEY": os.getenv("CLOUDINARY_API_KEY"),
                "CLOUDINARY_API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
                "GOOGLE_GENAI_USE_VERTEXAI": os.getenv("GOOGLE_GENAI_USE_VERTEXAI"),
            }
        )
        print(f"✅ Created remote agent: {remote_agent.resource_name}")
    except Exception as e:
        print(f"❌ Error in create(): {e}")

def delete(resource_id: str) -> None:
    """Deletes an existing deployment."""
    try:
        remote_app = agent_engines.get(resource_id)
        remote_app.delete(force=True)
        print(f"✅ Deleted remote app: {resource_id}")
    except Exception as e:
        print(f"❌ Error in delete(): {e}")

def list_deployments() -> None:
    """Lists all deployments."""
    try:
        deployments = agent_engines.list()
        if not deployments:
            print("⚠️ No deployments found.")
            return
        print("📦 Deployments:")
        for deployment in deployments:
            print(f"- {deployment.resource_name}")
    except Exception as e:
        print(f"❌ Error in list_deployments(): {e}")

def create_session(resource_id: str, user_id: str) -> None:
    """Creates a new session for the specified user."""
    try:
        adk_app = agent_engines.get(resource_id)
        remote_session = adk_app.create_session(user_id=user_id)
        print("✅ Created session:")
        print(remote_session)
        print("\nUse this session ID with --session_id when sending messages.")
        return remote_session
    except Exception as e:
        print(f"❌ Error in create_session(): {e}")

def list_sessions(resource_id: str, user_id: str) -> None:
    """Lists all sessions for the specified user."""
    try:
        remote_app = agent_engines.get(resource_id)
        sessions = remote_app.list_sessions(user_id=user_id)
        print(f"📘 Sessions for user '{user_id}':")
        for session in sessions:
            print(f"- Session ID: {session['id']}")
    except Exception as e:
        print(f"❌ Error in list_sessions(): {e}")

def get_session(resource_id: str, user_id: str, session_id: str) -> None:
    """Gets a specific session."""
    try:
        remote_app = agent_engines.get(resource_id)
        session = remote_app.get_session(user_id=user_id, session_id=session_id)
        print("📋 Session details:")
        print(f"  ID: {session['id']}")
        print(f"  User ID: {session['user_id']}")
        print(f"  App name: {session['app_name']}")
        print(f"  Last update time: {session['last_update_time']}")
    except Exception as e:
        print(f"❌ Error in get_session(): {e}")

def send_message_stream(resource_id: str,user_id: str, message: str) -> None:
    """Sends a message to the deployed agent using streaming."""

    session_response = create_session(resource_id, user_id)
    session_id = session_response["id"]
    print("Session ID:", session_id)

    try:
        remote_app = agent_engines.get(resource_id)
        print(f"📨 Sending message to session {session_id}:")
        print(f"Message: {message}")
        print("\n💬 Response:")
        for event in remote_app.stream_query(
            user_id=user_id,
            session_id=session_id,
            message=message,
        ):
            print(event)
    except Exception as e:
        print(f"❌ Error in send_message_stream(): {e}")
    finally:
        try:
            remote_app = agent_engines.get(resource_id)
            remote_app.delete_session(user_id=user_id, session_id=session_id)
            print(f"✅ Deleted session {session_id} for user {user_id}.")
        except Exception as e:
            print(f"❌ Error deleting session {session_id}: {e}")
        


def main(argv=None):
    """Main function that can be called directly or through app.run()."""
    # Parse flags first
    if argv is None:
        argv = flags.FLAGS(sys.argv)
    else:
        argv = flags.FLAGS(argv)

    load_dotenv()

    # Now we can safely access the flags
    project_id = (
        FLAGS.project_id if FLAGS.project_id else os.getenv("GOOGLE_CLOUD_PROJECT")
    )
    location = FLAGS.location if FLAGS.location else os.getenv("GOOGLE_CLOUD_LOCATION")
    bucket = FLAGS.bucket if FLAGS.bucket else os.getenv("GOOGLE_CLOUD_STAGING_BUCKET")
    user_id = FLAGS.user_id

    if not project_id:
        print("Missing required environment variable: GOOGLE_CLOUD_PROJECT")
        return
    elif not location:
        print("Missing required environment variable: GOOGLE_CLOUD_LOCATION")
        return
    elif not bucket:
        print("Missing required environment variable: GOOGLE_CLOUD_STAGING_BUCKET")
        return

    vertexai.init(
        project=project_id,
        location=location,
        staging_bucket=f"gs://{bucket}",
    )

    if FLAGS.create:
        create()
    elif FLAGS.delete:
        if not FLAGS.resource_id:
            print("resource_id is required for delete")
            return
        delete(FLAGS.resource_id)
    elif FLAGS.list:
        list_deployments()
    elif FLAGS.create_session:
        if not FLAGS.resource_id:
            print("resource_id is required for create_session")
            return
        create_session(FLAGS.resource_id, user_id)
    elif FLAGS.list_sessions:
        if not FLAGS.resource_id:
            print("resource_id is required for list_sessions")
            return
        list_sessions(FLAGS.resource_id, user_id)
    elif FLAGS.get_session:
        if not FLAGS.resource_id:
            print("resource_id is required for get_session")
            return
        if not FLAGS.session_id:
            print("session_id is required for get_session")
            return
        get_session(FLAGS.resource_id, user_id, FLAGS.session_id)
    elif FLAGS.send_stream:
        if not FLAGS.resource_id:
            print("resource_id is required for send")
            return
        if not FLAGS.user_id:
            print("user_id is required for send")
            return
        send_message_stream(FLAGS.resource_id, FLAGS.user_id, FLAGS.message)
    else:
        print(
            "Please specify one of: --create, --delete, --list, --create_session, --list_sessions, --get_session, or  --send_stream"
        )

if __name__ == "__main__":
    app.run(main)