# APIs:

## Admin routes:
[x] - `/admin/event/create` - Create an event.
[x] - `/admin/event/update/:id` - Edit an event by id in param.
(Check if the event might be deleted already).


## Participant routes:
[] - `/participant/event/register/:id` - Can join an event by event id
[] - `/participant/event/cancel-registration/:id` - Can cancel participation.

## Event routes:
[] - `/event/details/:id` - Gives confirmed list, waitlist and basic details of an event.