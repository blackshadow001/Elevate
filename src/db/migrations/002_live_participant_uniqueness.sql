CREATE UNIQUE INDEX live_one_active_participant_idx
ON live_participants(live_class_id,user_id) WHERE left_at IS NULL;
