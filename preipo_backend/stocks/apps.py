import os
import threading
import time
import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)

def _refresh_loop():
    # Wait 12h before first run (already seeded at deploy time)
    time.sleep(12 * 60 * 60)
    while True:
        try:
            from django.core.management import call_command
            call_command('refresh_fundamentals')
            logger.info('refresh_fundamentals completed')
        except Exception as e:
            logger.error(f'refresh_fundamentals failed: {e}')
        time.sleep(12 * 60 * 60)

class StocksConfig(AppConfig):
    name = 'stocks'

    def ready(self):
        # Only start in the main gunicorn process, not in manage.py subcommands
        if os.environ.get('DJANGO_SKIP_SCHEDULER'):
            return
        t = threading.Thread(target=_refresh_loop, daemon=True, name='fundamentals-refresh')
        t.start()
        logger.info('Fundamentals refresh scheduler started (12h interval)')
