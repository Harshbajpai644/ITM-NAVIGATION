from django.test import SimpleTestCase

from apps.buildings.models import Building


class BuildingModelSmokeTest(SimpleTestCase):
    def test_category_choices_exist(self):
        values = {c[0] for c in Building.Category.choices}
        self.assertIn("academic", values)
        self.assertIn("gate", values)