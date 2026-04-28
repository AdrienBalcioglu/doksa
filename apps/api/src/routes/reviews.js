import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { responded, response_text } = req.body;

  const updates = {};
  if (typeof responded === 'boolean') updates.responded = responded;
  if (response_text !== undefined) updates.response_text = response_text;

  if (!Object.keys(updates).length)
    return res.status(400).json({ error: 'no fields to update' });

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'review not found' });
  res.json(data);
});

export default router;
