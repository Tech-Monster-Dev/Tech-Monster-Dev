import json
import subprocess
from pathlib import Path

p = Path("backend/data/courses/javascript/course.json")
data = json.loads(p.read_text(encoding="utf-8"))

formatted = 0
skipped = 0

for module in data["course"].get("modules", []):
    for lesson in module.get("lessons", []):
        for note in lesson.get("notes", []):
            if note.get("type") != "code":
                continue

            code = str(note.get("code", ""))

            # Already multiline/indented code is preserved.
            if "\n" in code:
                skipped += 1
                continue

            result = subprocess.run(
                ["npx.cmd", "prettier", "--parser", "babel"],
                input=code,
                text=True,
                capture_output=True,
                cwd="frontend",
            )

            if result.returncode != 0:
                raise RuntimeError(
                    f"Prettier failed for: {lesson.get('title')}\n"
                    f"{result.stderr}"
                )

            note["code"] = result.stdout.rstrip()
            formatted += 1

p.write_text(
    json.dumps(data, indent=4, ensure_ascii=False) + "\n",
    encoding="utf-8",
)

print(f"Formatted single-line code blocks: {formatted}")
print(f"Already multiline blocks preserved: {skipped}")
