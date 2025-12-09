#!/usr/bin/env python3
"""Script to add collapsible functionality to all category groups"""

import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find category groups
# Replace <h4 class="group-title">Title</h4> with collapsible version
pattern = r'<h4 class="group-title">([^<]+)</h4>'
replacement = r'<h4 class="group-title collapsible"><span class="collapse-icon">▼</span>\1</h4>\n            <div class="category-items">'

content = re.sub(pattern, replacement, content)

# Now we need to close the category-items div before each </div> that closes category-group
# Find pattern: (labels...) </div> where </div> closes category-group
# We need to add </div> before the category-group closing div

# Split by category-group divs and process
lines = content.split('\n')
new_lines = []
in_category_group = False
seen_labels = False

for i, line in enumerate(lines):
    if '<div class="category-group">' in line:
        in_category_group = True
        seen_labels = False
    elif in_category_group and '<label class="category-label"' in line:
        seen_labels = True
    elif in_category_group and seen_labels and '</div>' in line and 'category-items' not in line:
        # This is the closing div for category-group, insert closing div for category-items first
        new_lines.append('            </div>')
        in_category_group = False
        seen_labels = False

    new_lines.append(line)

content = '\n'.join(new_lines)

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated HTML with collapsible category groups!")
