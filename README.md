## Run the Tech Demo

1. clone the repo (unzip if needed)
2. go in to the root directory (where you can find the ``docker-compose.yml``)
3. ``docker compose up``
 - If it aborts with 'The container name XXX is already in use by container <container id>', run ``docker rm <container id>`` to remove the previous container. 
5. Wait enough time for the rasa to load the model (you can tell from the log)
6. ``localhost:1337``
