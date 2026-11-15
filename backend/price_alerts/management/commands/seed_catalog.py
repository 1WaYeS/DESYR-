import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand,CommandError
from price_alerts.models import CatalogProduct

class Command(BaseCommand):
    help = 'Import the DESYR demonstration price snapshot; never overwrites existing prices.'
    def handle(self,*args,**options):
        if not settings.DEBUG:
            raise CommandError('Snapshot seeding is development-only. Connect an official catalog adapter in production.')
        records = json.loads((Path(__file__).resolve().parents[2] / 'fixtures' / 'catalog.json').read_text(encoding='utf-8'))
        count = 0
        for record in records:
            _,created = CatalogProduct.objects.get_or_create(external_id=record.pop('external_id'),defaults=record)
            count += int(created)
        self.stdout.write(f'Created {count} demonstration products. Live-price flags remain off.')
