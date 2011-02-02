/*
 * Copyright 2007-2010 AjaxTags-Team
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package net.sourceforge.ajaxtags.tags;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

/**
 * Test for AjaxTabPageTag.
 */
public class AjaxTabPageTagTest extends AbstractTagTest<AjaxTabPageTag> {

    /**
     * Set up.
     *
     * @throws Exception
     *             if setUp fails
     */
    @Before
    public void setUp() throws Exception {
        setUp(AjaxTabPageTag.class);
    }

    @Test
    public void testToString() {
        assertEquals("No options", "{}", tag.toString());
        tag.setId("id");
        assertEquals("Id", "{id: \"id\"}", tag.toString());
        tag.setId(null);
        tag.setCaption("test");
        assertEquals("Caption", "{caption: \"test\"}", tag.toString());
    }

}