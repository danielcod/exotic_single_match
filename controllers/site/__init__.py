from controllers import *

RootDeps=yaml.load("""
- css/lib/bootstrap.min.css
- css/lib/jumbotron-narrow.css
- css/lib/bs-wizard.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
""")

Title="ioSport Exotics Demo"

Leagues=yaml.load(file("config/leagues.yaml").read())

