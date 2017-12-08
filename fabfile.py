import os, re, yaml

AppEngineHome="~/packages/google-cloud-sdk/platform/google_appengine"
#AppEngineHome = r'"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\platform\google_appengine"'
#AppEngineHome="/usr/bin/"
PathToDatastore = "tmp/dev_appserver.datastore"
Email = "daniel.liu717@gmail.com"
DevPort, DevAdminPort = 8080, 8000


def to_argslist(args):
    def keypair(key, value=None):
        return ("--%s=%s" % (key, value)) if value else ("--%s" % key)
    return " ".join([keypair(key, value)
                     for key, value in args.items()])


def dev_appserver(port=DevPort, admin_port=DevAdminPort, path=PathToDatastore):
    args = {"port": port, "admin_port": admin_port, "datastore_path": path}
    expr = "python %s/dev_appserver.py %s ." % (AppEngineHome, to_argslist(args))
    print(expr)
    os.system(expr)

"""
http://stackoverflow.com/questions/10407955/google-app-engine-this-application-does-not-exist?lq=1
"""


def deploy(action="update", email=Email):
    args = {"email": email, # "oauth2": None, # now default
            "no_cookies": None} # *** NB ***
    expr = "python %s/appcfg.py %s %s ." % (AppEngineHome, action, to_argslist(args))
    os.system(expr)


def deploy_cron(email=Email):
    deploy(action="update_cron", email=email)


def deploy_queues(email=Email):
    deploy(action="update_queues", email=email)


def rollback(action="rollback"):
    expr = "python %s/appcfg.py %s ." % (AppEngineHome, action)
    os.system(expr)


def refactor_src(pat, rep, root): # pattern, replacement, root
    def refactor(tokens):
        path = "/".join(tokens)
        for entry in os.listdir(path):
            newtokens = tokens+[entry]
            filename = "/".join(newtokens)
            if os.path.isdir(filename):
                refactor(newtokens)
            elif filename.endswith("pyc"):
                pass
            else:
                text = file(filename).read()
                newtext = re.sub(pat, rep, text)
                if text != newtext:
                    print filename
                    dest = file(filename, 'w')
                    dest.write(newtext)
                    dest.close()
    refactor([root])

