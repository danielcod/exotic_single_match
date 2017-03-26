import os, re, yaml

# AppEngineHome="~/packages/google_appengine-1.9.40"

AppEngineHome="~/packages/google-cloud-sdk/platform/google_appengine"

PathToDatastore="tmp/dev_appserver.datastore"

Email="justin.worrall@gmail.com"

DevPort, DevAdminPort  = 8080, 8000

def to_argslist(args):
    def keypair(key, value=None):
        return ("--%s=%s" % (key, value)) if value else ("--%s" % key)
    return " ".join([keypair(key, value)
                     for key, value in args.items()])

def dev_appserver(port=DevPort, 
                  admin_port=DevAdminPort, 
                  path=PathToDatastore):
    args={"port": port,
          "admin_port": admin_port,
          "datastore_path": path}
    expr="python %s/dev_appserver.py %s ." % (AppEngineHome,
                                              to_argslist(args))
    os.system(expr)

"""
http://stackoverflow.com/questions/10407955/google-app-engine-this-application-does-not-exist?lq=1
"""

def deploy(action="update", email=Email):
    args={"email": email,
          # "oauth2": None, # now default
          "no_cookies": None} # *** NB ***
    expr="python %s/appcfg.py %s %s ." % (AppEngineHome,
                                          action,
                                          to_argslist(args))
    os.system(expr)

def deploy_cron(email=Email):
    deploy(action="update_cron", email=email)

def deploy_queues(email=Email):    
    deploy(action="update_queues", email=email)

def rollback(action="rollback"):
    expr="python %s/appcfg.py %s ." % (AppEngineHome,
                                       action)
    os.system(expr)

def refactor_src(pat, rep, root): # pattern, replacement, root
    def refactor(tokens):
        path="/".join(tokens)
        for entry in os.listdir(path):
            newtokens=tokens+[entry]
            filename="/".join(newtokens)
            if os.path.isdir(filename):
                refactor(newtokens)
            elif filename.endswith("pyc"):
                pass
            else:
                text=file(filename).read()
                newtext=re.sub(pat, rep, text)
                if text!=newtext:
                    print filename
                    dest=file(filename, 'w')
                    dest.write(newtext)
                    dest.close()
    refactor([root])

def install_sdc(version="0.1"):
    os.system("sudo rm -r lib/sport_data_client*")
    os.system("pip install -t lib ../sport_data_client/dist/sport_data_client-%s.zip" % version)

def compress_js(filename="exotics-engine.js",
                depsfile="config/app_deps.yaml"):
    deps=[dep for dep in yaml.load(file(depsfile).read())
          if dep.startswith("js/app")]
    tmppath="tmp/%s "% filename
    dest=file(tmppath, 'w')
    dest.write("\n".join([file(dep).read()
                          for deps in deps]))
    dest.close()
    destpath="js/app/%s" % filename.replace(".js", ".min.js")
    os.system("yui-compressor %s -o %s" % (tmppath, destpath))

    
