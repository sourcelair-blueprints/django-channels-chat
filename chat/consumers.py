from channels import Group
from channels.sessions import channel_session


@channel_session
def ws_add(message, room):
    Group('chat-%s' % room).add(message.reply_channel)
    message.channel_session['room'] = room


@channel_session
def ws_echo(message):
    room = message.channel_session['room']
    Group('chat-%s' % room).send({
        'text': message.content['text'],
    })
