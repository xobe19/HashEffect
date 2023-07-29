Checkpoint 1A: Implement Field math

Checkpoint 1B: Implement SSS

We created a testing API to verify your implementation. Once you hit our API, we can verify success.

Will share the API details in due time

It should be ready by 2:30 PM

# Hasheffect API docs

**Verifiable Secret Sharing (VSS)**

**Part-A**

On **GET request on /vss/share/valid** using your postman/thunderclient.

You will get a JSON response in which **share & commitments along with group parameters are valid.** You must verify the given share with the commitments.

And on **GET request on /vss/share/invalid ,** you will get a response which is **invalid.**

Cross check accordingly.

**Part-B**

Now generate your commitments and a share , change the body (whose format is same as the response in the get request) and send a **post request on /vss/verify**.
