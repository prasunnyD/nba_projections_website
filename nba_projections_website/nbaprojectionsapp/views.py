from django.shortcuts import render, HttpResponse

# Create your views here.
def home(request):
    oefg= request.GET['OEFG']
    ooreb= request.GET['OFTR']
    oftr= request.GET['OREB']
    pace=request.GET["PACE"]
    return render(request,"home.html")
