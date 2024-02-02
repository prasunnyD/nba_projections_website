from django.shortcuts import render, HttpResponse

# Create your views here.
def home(request):
    if request.method == 'POST':
        oefg= request.POST['OEFG']
        ooreb= request.POST['OFTR']
        oftr= request.POST['OREB']
        pace=request.POST["PACE"]
    return render(request,"home.html")
