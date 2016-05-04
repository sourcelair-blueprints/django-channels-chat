from channels import Group


def ws_add(message):
    Group('chat').add(message.reply_channel)


def ws_echo(message):
    Group('chat').send({
        'text': message.content['text'],
    })
