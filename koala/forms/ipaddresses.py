# -*- coding: utf-8 -*-
"""
Forms for Elastic IP operations

"""
import wtforms
from wtforms import validators, widgets

from pyramid.i18n import TranslationString as _

from . import BaseSecureForm


class AllocateIPsForm(BaseSecureForm):
    """Allocate IP Addresses form, used on IP Addresses landing page in modal dialog"""
    ipcount_error_msg = _(u'Invalid number')
    ipcount = wtforms.TextField(
        label=_(u'Number to allocate:'),
        validators=[validators.Required(message=ipcount_error_msg)],
        widget=widgets.TextInput(),
    )

    def __init__(self, request, **kwargs):
        super(AllocateIPsForm, self).__init__(request, **kwargs)
        self.ipcount.error_msg = self.ipcount_error_msg


class AssociateIPForm(BaseSecureForm):
    """Associate an Elastic IP with an instance"""
    instance_error_msg = _(u'Instance is required')
    instance_id = wtforms.SelectField(
        label=_(u'Instance:'),
        validators=[validators.Required(message=instance_error_msg)],
    )

    def __init__(self, request, conn=None, **kwargs):
        super(AssociateIPForm, self).__init__(request, **kwargs)
        self.conn = conn
        self.instance_id.choices = self.get_instance_choices()
        self.instance_id.error_msg = self.instance_error_msg

    def get_instance_choices(self):
        choices = [('', _(u'Select instance...'))]
        if self.conn:
            for instance in self.conn.get_only_instances():
                value = instance.id
                inst_name_tag = instance.tags.get('Name', '')
                label = '{0}{1}'.format(
                    inst_name_tag if inst_name_tag else instance.id, ' ({0})'.format(instance.id) if inst_name_tag else '')
                choices.append((value, label))
        return choices


class DisassociateIPForm(BaseSecureForm):
    """No fields required here except the CSRF token"""
    pass


class ReleaseIPForm(BaseSecureForm):
    """No fields required here except the CSRF token"""
    pass

