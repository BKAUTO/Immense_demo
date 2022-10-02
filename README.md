<img width="1276" alt="Screen Shot 2022-09-15 at 8 42 40 PM" src="https://user-images.githubusercontent.com/29847870/193449351-9271f97a-419b-4412-9cc5-28ee35dc1326.png">

## Run the Tech Demo

1. clone the repo (unzip if needed)
2. go in to the root directory (where you can find the ``docker-compose.yml``)
3. ``docker compose up``
 - If it aborts with 'The container name XXX is already in use by container <container id>', run ``docker rm <container id>`` to remove the previous container. 
5. Wait enough time for the rasa to load the model (you can tell from the log)
6. ``localhost:1337``
