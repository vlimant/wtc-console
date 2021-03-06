from rest_framework_mongoengine.routers import DefaultRouter
from workflows.views import TasksViewSet, SitesViewSet

router = DefaultRouter()
# router.register(r'workflows', WorkflowsViewSet, base_name='workflow')
# router.register(r'preps', PrepsViewSet, base_name='preps')
router.register(r'tasks', TasksViewSet, base_name='tasks')
router.register(r'sites', SitesViewSet, base_name='sites')
urlpatterns = router.urls
