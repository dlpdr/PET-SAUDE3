from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models.functions import Lower


class Migration(migrations.Migration):
    dependencies = [('accounts', '0001_initial')]
    operations = [migrations.AddField(model_name='user', name='google_subject', field=models.CharField(max_length=255, unique=True, null=True, blank=True)), migrations.CreateModel(
        name='AccountToken',
        fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('purpose', models.CharField(choices=[('confirm', 'Confirmar e-mail'), ('reset', 'Redefinir senha')], max_length=20)),
            ('digest', models.CharField(max_length=64, unique=True)),
            ('expires_at', models.DateTimeField()),
            ('created_at', models.DateTimeField(auto_now_add=True)),
            ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='account_tokens', to=settings.AUTH_USER_MODEL)),
        ],
    ), migrations.AddConstraint(model_name='user', constraint=models.UniqueConstraint(Lower('email'), condition=~models.Q(email=''), name='unique_nonempty_user_email'))]
