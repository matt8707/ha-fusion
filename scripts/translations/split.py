"""split.py"""

import sys
import json
import os

OUTPUT_PATH = sys.argv[1]
translations = json.load(sys.stdin)

for language_code, translation_data in translations.items():
    output_file_path = os.path.join(OUTPUT_PATH, f"{language_code}.json")

    with open(output_file_path, "w", encoding="utf-8") as output_file:
        json.dump(translation_data, output_file, indent="\t")
        output_file.write("\n")
