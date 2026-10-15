from .base import *
from django.db.backends.signals import connection_created
from django.dispatch import receiver

DEBUG = True

# SQLite PRAGMA Configuration for WAL Mode and Busy Timeout
@receiver(connection_created)
def configure_sqlite_pragmas(sender, connection, **kwargs):
    if connection.vendor == 'sqlite':
        cursor = connection.cursor()
        cursor.execute('PRAGMA journal_mode = WAL;')
        cursor.execute('PRAGMA busy_timeout = 5000;')  # 5000ms busy wait
        cursor.execute('PRAGMA synchronous = NORMAL;')
        cursor.execute('PRAGMA foreign_keys = ON;')
