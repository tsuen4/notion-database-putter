local/env.json:
	cp local/env.json.template $@

local/event.json:
	cp local/event.json.template $@

prepare-local-invoke: local/env.json local/event.json

.PHONY: invoke-putter
invoke-putter: local/env.json local/event.json
	sam local invoke PutterFunction --env-vars local/env.json --event local/event.json
