"""Business-logic services for the accounts domain.

Services hold multi-step domain operations that are independent of the HTTP
layer, so they can be reused (API, management commands, tasks) and unit-tested
without a request. The API layer (serializers/views) stays thin and delegates
here.
"""
