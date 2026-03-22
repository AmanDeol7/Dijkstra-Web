# NextJs Server Services

All server services reside here

Calls can be made to the following APIs:

- Any Call that needs to be made at the NextJs Server Level goes in this folder
- Any call that requires data from the API Services - Goes in The Services Folder

Be very clear with where you want to place services:

- Nextjs Server - Currently houses onboarding functionality, session mgmt, etc
- Services i.e. Microservices (Dataforge, Gitripper, Helios)
  - API calls made to the microservices get placed here.
