### New AppEngine deployment

- need an extra step in addition to creating via web console

-----------

jhw@jhw-ThinkPad-X220:~/work/exotics_engine$ gcloud config set project iosport-exotics-engine
Updated property [core/project].
jhw@jhw-ThinkPad-X220:~/work/exotics_engine$ gcloud beta app create
Please choose a region for your application. After choosing a region, 
it cannot be changed. Which region would you like to choose?

 [1] us-central    (supports standard and flexible)
 [2] europe-west   (supports standard)
 [3] us-east1      (supports standard and flexible)
 [4] asia-northeast1 (supports standard and flexible)
Please enter your numeric choice:  2

Creating App Engine application in project [iosport-exotics-engine] and region [
europe-west]....done.                                                           
Success! The app is now created. Please use `gcloud app deploy` to deploy your first app.

-----------

'fab deploy' still works; but looks like new 'gcloud app deploy' wants you to remove app name from app.yaml :-/

run
python2.7 /home/incode2015/google-cloud-sdk/platform/google_appengine/dev_appserver.py  .
