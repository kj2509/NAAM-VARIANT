FROM jjanzic/docker-python3-opencv
WORKDIR /app 
COPY . /app 
RUN pip install -r requirements.txt 
EXPOSE 5000 
CMD ["python3","app.py"]
