from django.test import TestCase
import json
# Create your tests here.

print(json.loads(json.dumps({"sm":True}))["sm"])