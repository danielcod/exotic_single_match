from controllers import *

import apis.yc_lite_api as yc_lite

RootDeps=yaml.load("""
- css/lib/bootstrap.min.css
- css/lib/jumbotron-narrow.css
- css/lib/bs-wizard.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
""")

Title="Team Exotics Demo"

Leagues=yaml.load(file("config/leagues.yaml").read())


