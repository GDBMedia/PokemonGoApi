import argparse

def init_config():
    parser = argparse.ArgumentParser()
    config_file = "config.json"

    # If config file exists, load variables from json
    # load   = {}
    # if os.path.isfile(config_file):
    #     with open(config_file) as data:
    #         load.update(json.load(data))

    # Read passed in Arguments
    # required = lambda x: not x in load
    parser.add_argument("-a", "--auth_service", help="Auth Service ('ptc' or 'google')")
    parser.add_argument("-u", "--username", help="Username")
    parser.add_argument("-p", "--password", help="Password")
    parser.add_argument("-l", "--location", help="Location")
    parser.set_defaults(DEBUG=False, TEST=False)
    config = parser.parse_args()

    return config


config = init_config()
print config.username + "  " + config.password + "  " + config.location
